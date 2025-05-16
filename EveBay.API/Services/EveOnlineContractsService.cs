using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using EveBay.API.Models;
using System.Text.Json.Serialization;

namespace EveBay.API.Services
{
    public interface IEveOnlineContractsService
    {
        Task<IEnumerable<Contract>> GetCorporationContractsAsync(int corporationId, string accessToken, bool includeFinished = false);
        Task<Contract> GetContractDetailsAsync(int contractId, string accessToken);
        Task<IEnumerable<ContractItem>> GetContractItemsAsync(int contractId, string accessToken);
    }

    public class EveOnlineContractsService : IEveOnlineContractsService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<EveOnlineContractsService> _logger;
        private const string ESI_BASE_URL = "https://esi.evetech.net/latest";
        private const int LUX_MUNDI_CORPORATION_ID = 98665606;
        private readonly Dictionary<int, string> _typeNameCache;

        public EveOnlineContractsService(
            HttpClient httpClient,
            ILogger<EveOnlineContractsService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _typeNameCache = new Dictionary<int, string>();
        }

        private async Task<string> GetTypeNameAsync(int typeId)
        {
            if (_typeNameCache.TryGetValue(typeId, out string cachedName))
            {
                return cachedName;
            }

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, $"{ESI_BASE_URL}/universe/types/{typeId}/");
                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var typeInfo = JsonSerializer.Deserialize<TypeInfo>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (typeInfo != null)
                {
                    _typeNameCache[typeId] = typeInfo.Name;
                    return typeInfo.Name;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch type name for type ID {TypeId}", typeId);
            }

            return $"Unknown Item ({typeId})";
        }

        public async Task<IEnumerable<Contract>> GetCorporationContractsAsync(int corporationId, string accessToken, bool includeFinished = false)
        {
            _logger.LogInformation("Fetching contracts for corporation {CorporationId}", corporationId);

            var request = new HttpRequestMessage(HttpMethod.Get, $"{ESI_BASE_URL}/corporations/{corporationId}/contracts/");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("Received contract data: {Content}", content);

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var contracts = JsonSerializer.Deserialize<List<Contract>>(content, options);
                
                if (contracts == null)
                {
                    _logger.LogWarning("Deserialized contracts list is null");
                    return new List<Contract>();
                }

                // Filter out finished contracts unless explicitly requested
                if (!includeFinished)
                {
                    contracts = contracts.Where(c => c.Status?.ToLower() != "finished").ToList();
                }

                _logger.LogInformation("Successfully retrieved {Count} contracts for corporation {CorporationId}", 
                    contracts.Count, corporationId);

                return contracts;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize contracts response");
                throw new Exception($"Failed to deserialize contracts: {ex.Message}", ex);
            }
        }

        public async Task<Contract> GetContractDetailsAsync(int contractId, string accessToken)
        {
            _logger.LogInformation("Fetching details for contract {ContractId}", contractId);

            var request = new HttpRequestMessage(HttpMethod.Get, $"{ESI_BASE_URL}/contracts/public/{contractId}/");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("Received contract details: {Content}", content);

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var contract = JsonSerializer.Deserialize<Contract>(content, options);

                if (contract == null)
                {
                    _logger.LogWarning("Deserialized contract is null for contract ID {ContractId}", contractId);
                    return null;
                }

                _logger.LogInformation("Successfully retrieved details for contract {ContractId}", contractId);
                return contract;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize contract details");
                throw new Exception($"Failed to deserialize contract details: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ContractItem>> GetContractItemsAsync(int contractId, string accessToken)
        {
            _logger.LogInformation("Fetching items for contract {ContractId}", contractId);

            var request = new HttpRequestMessage(HttpMethod.Get, $"{ESI_BASE_URL}/corporations/{LUX_MUNDI_CORPORATION_ID}/contracts/{contractId}/items/");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("Received contract items: {Content}", content);

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var items = JsonSerializer.Deserialize<List<ContractItem>>(content, options);

                if (items == null)
                {
                    _logger.LogWarning("Deserialized items list is null for contract ID {ContractId}", contractId);
                    return new List<ContractItem>();
                }

                // Fetch item names for each item
                var tasks = items.Select(async item =>
                {
                    item.ItemName = await GetTypeNameAsync(item.TypeId);
                    return item;
                });

                items = (await Task.WhenAll(tasks)).ToList();

                _logger.LogInformation("Successfully retrieved {Count} items for contract {ContractId}", 
                    items.Count, contractId);

                return items;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize contract items");
                throw new Exception($"Failed to deserialize contract items: {ex.Message}", ex);
            }
        }
    }

    public class TypeInfo
    {
        [JsonPropertyName("type_id")]
        public int TypeId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }
    }

    public class ContractItem
    {
        [JsonPropertyName("record_id")]
        public long RecordId { get; set; }

        [JsonPropertyName("type_id")]
        public int TypeId { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("raw_quantity")]
        public int? RawQuantity { get; set; }

        [JsonPropertyName("is_singleton")]
        public bool IsSingleton { get; set; }

        [JsonPropertyName("is_included")]
        public bool IsIncluded { get; set; }

        [JsonPropertyName("item_name")]
        public string ItemName { get; set; }
    }
} 