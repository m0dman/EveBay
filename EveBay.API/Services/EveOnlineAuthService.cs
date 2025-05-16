using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using EveBay.API.Models;
using System.Text.Json.Serialization;
using System.Web;

namespace EveBay.API.Services
{
    public class EveOnlineAuthService : IEveOnlineAuthService
    {
        private readonly EveOnlineSettings _settings;
        private readonly ILogger<EveOnlineAuthService> _logger;
        private static readonly Dictionary<string, TokenSession> _sessions = new();

        public EveOnlineAuthService(
            IOptions<EveOnlineSettings> settings,
            ILogger<EveOnlineAuthService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public string GetAuthorizationUrl()
        {
            var baseUrl = "https://login.eveonline.com/v2/oauth/authorize";
            var scopes = string.Join(" ", _settings.Scopes);
            var callbackUrl = HttpUtility.UrlEncode(_settings.CallbackUrl);

            _logger.LogInformation("Generating authorization URL with settings:");
            _logger.LogInformation("ClientId: {ClientId}", _settings.ClientId);
            _logger.LogInformation("CallbackUrl: {CallbackUrl}", _settings.CallbackUrl);
            _logger.LogInformation("Scopes: {Scopes}", scopes);

            var url = $"{baseUrl}?response_type=code&redirect_uri={callbackUrl}&client_id={_settings.ClientId}&scope={HttpUtility.UrlEncode(scopes)}&state={Guid.NewGuid()}";
            
            _logger.LogInformation("Generated authorization URL: {Url}", url);
            return url;
        }

        public async Task<(bool success, string sessionId)> HandleCallbackAsync(string code)
        {
            try
            {
                _logger.LogInformation("Handling callback with code: {Code}", code);
                var tokenUrl = "https://login.eveonline.com/v2/oauth/token";
                var callbackUrl = _settings.CallbackUrl;

                using var client = new HttpClient();
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "authorization_code"),
                    new KeyValuePair<string, string>("code", code),
                    new KeyValuePair<string, string>("client_id", _settings.ClientId),
                    new KeyValuePair<string, string>("client_secret", _settings.ClientSecret),
                    new KeyValuePair<string, string>("redirect_uri", callbackUrl)
                });

                var response = await client.PostAsync(tokenUrl, content);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Token response received: {Result}", result);
                    
                    try
                    {
                        var tokenData = JsonSerializer.Deserialize<TokenResponse>(result);
                        if (tokenData?.AccessToken != null)
                        {
                            var sessionId = GenerateSessionId();
                            _sessions[sessionId] = new TokenSession
                            {
                                AccessToken = tokenData.AccessToken,
                                ExpiresAt = DateTime.UtcNow.AddSeconds(tokenData.ExpiresIn),
                                RefreshToken = tokenData.RefreshToken
                            };
                            _logger.LogInformation("Successfully stored token in session: {SessionId}", sessionId);
                            return (true, sessionId);
                        }
                        else
                        {
                            _logger.LogError("Token response did not contain an access token");
                            return (false, null);
                        }
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Failed to parse token response");
                        return (false, null);
                    }
                }

                _logger.LogError("Failed to get token. Status: {Status}, Response: {Response}", 
                    response.StatusCode, 
                    await response.Content.ReadAsStringAsync());
                return (false, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling callback");
                return (false, null);
            }
        }

        public Task<string> GetAccessTokenAsync(string sessionId)
        {
            _logger.LogInformation("Getting access token for session: {SessionId}", sessionId);
            
            if (!string.IsNullOrEmpty(sessionId) && _sessions.TryGetValue(sessionId, out var session))
            {
                if (session.ExpiresAt > DateTime.UtcNow)
                {
                    _logger.LogInformation("Found valid token for session: {SessionId}", sessionId);
                    return Task.FromResult(session.AccessToken);
                }
                _logger.LogInformation("Token expired for session: {SessionId}", sessionId);
                _sessions.Remove(sessionId);
            }
            else
            {
                _logger.LogWarning("No session found for ID: {SessionId}", sessionId);
            }
            return Task.FromResult(string.Empty);
        }

        private string GenerateSessionId()
        {
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            var bytes = new byte[32];
            rng.GetBytes(bytes);
            var sessionId = Convert.ToBase64String(bytes);
            _logger.LogInformation("Generated new session ID: {SessionId}", sessionId);
            return sessionId;
        }

        public async Task<CharacterInfo> GetCharacterInfoAsync(string sessionId)
        {
            _logger.LogInformation("Getting character info for session: {SessionId}", sessionId);
            
            var token = await GetAccessTokenAsync(sessionId);
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("No valid token found for session: {SessionId}", sessionId);
                return null;
            }

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            
            var response = await client.GetAsync("https://login.eveonline.com/oauth/verify");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var characterInfo = JsonSerializer.Deserialize<CharacterInfo>(content);
                _logger.LogInformation("Successfully retrieved character info for session: {SessionId}", sessionId);
                return characterInfo;
            }

            _logger.LogError("Failed to get character info. Status: {Status}", response.StatusCode);
            return null;
        }
    }

    public class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }
    }

    public class TokenSession
    {
        public string AccessToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string RefreshToken { get; set; }
    }

    public class CharacterInfo
    {
        [JsonPropertyName("CharacterID")]
        public int CharacterId { get; set; }

        [JsonPropertyName("CharacterName")]
        public string CharacterName { get; set; }

        [JsonPropertyName("ExpiresOn")]
        public DateTime ExpiresOn { get; set; }

        [JsonPropertyName("Scopes")]
        public string Scopes { get; set; }

        [JsonPropertyName("TokenType")]
        public string TokenType { get; set; }

        [JsonPropertyName("CharacterOwnerHash")]
        public string CharacterOwnerHash { get; set; }
    }
} 