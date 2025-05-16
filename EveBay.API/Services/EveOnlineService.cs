using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using EveBay.API.Models;
using Microsoft.Extensions.Logging;

namespace EveBay.API.Services
{
    public class EveOnlineService : IEveOnlineService
    {
        private readonly HttpClient _httpClient;
        private readonly IEveOnlineAuthService _authService;
        private readonly EveOnlineSettings _settings;
        private readonly ILogger<EveOnlineService> _logger;

        public EveOnlineService(
            HttpClient httpClient, 
            IEveOnlineAuthService authService, 
            IOptions<EveOnlineSettings> settings,
            ILogger<EveOnlineService> logger)
        {
            _httpClient = httpClient;
            _authService = authService;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<IEnumerable<Contract>> GetCorporationContractsAsync(int corporationId, string sessionId)
        {
            try
            {
                var token = await _authService.GetAccessTokenAsync(sessionId);
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("No valid token found for session: {SessionId}", sessionId);
                    throw new UnauthorizedAccessException("No valid authentication token");
                }

                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await _httpClient.GetAsync($"https://esi.evetech.net/latest/corporations/{corporationId}/contracts/");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var contracts = JsonSerializer.Deserialize<List<Contract>>(content);
                
                return contracts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch corporation contracts");
                throw new Exception($"Failed to fetch corporation contracts: {ex.Message}", ex);
            }
        }

        public async Task<Contract> GetContractDetailsAsync(int contractId, string sessionId)
        {
            try
            {
                var token = await _authService.GetAccessTokenAsync(sessionId);
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("No valid token found for session: {SessionId}", sessionId);
                    throw new UnauthorizedAccessException("No valid authentication token");
                }

                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await _httpClient.GetAsync($"https://esi.evetech.net/latest/corporations/98665606/contracts/{contractId}/");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var contract = JsonSerializer.Deserialize<Contract>(content);
                
                return contract;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch contract details");
                throw new Exception($"Failed to fetch contract details: {ex.Message}", ex);
            }
        }
    }
} 