using Microsoft.AspNetCore.Mvc;
using EveBay.API.Services;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;

namespace EveBay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IEveOnlineAuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private const string SESSION_COOKIE_NAME = "evebay_session_id";

        public AuthController(
            IEveOnlineAuthService authService, 
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            var authUrl = _authService.GetAuthorizationUrl();
            _logger.LogInformation("Redirecting to EVE Online login: {Url}", authUrl);
            return Redirect(authUrl);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, string state)
        {
            _logger.LogInformation("Received callback with code: {Code}, state: {State}", code, state);
            
            if (string.IsNullOrEmpty(code))
            {
                _logger.LogWarning("No authorization code provided");
                return BadRequest("No authorization code provided");
            }

            var result = await _authService.HandleCallbackAsync(code);
            _logger.LogInformation("HandleCallbackAsync result - Success: {Success}, SessionId: {SessionId}", 
                result.success, result.sessionId);

            if (result.success && !string.IsNullOrEmpty(result.sessionId))
            {
                var frontendUrl = _configuration["FrontendUrl"] ?? "https://localhost:4200";
                var response = Redirect($"{frontendUrl}/auth/callback");

                // Set the session cookie
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/",
                    Domain = "localhost",
                    Expires = DateTime.UtcNow.AddHours(24) // Cookie expires in 24 hours
                };

                Response.Cookies.Append(SESSION_COOKIE_NAME, result.sessionId, cookieOptions);
                _logger.LogInformation("Set session cookie for session ID: {SessionId}", result.sessionId);

                return response;
            }

            _logger.LogWarning("Authentication failed - Success: {Success}, SessionId: {SessionId}", 
                result.success, result.sessionId);
            return Redirect($"{_configuration["FrontendUrl"] ?? "https://localhost:4200"}/auth/callback?error=auth_failed");
        }

        [HttpGet("session")]
        public async Task<IActionResult> GetSession()
        {
            var sessionId = Request.Cookies[SESSION_COOKIE_NAME];
            _logger.LogInformation("Checking session. Session ID from cookie: {SessionId}", sessionId);
            
            if (!string.IsNullOrEmpty(sessionId))
            {
                var token = await _authService.GetAccessTokenAsync(sessionId);
                if (!string.IsNullOrEmpty(token))
                {
                    _logger.LogInformation("Valid session found for ID: {SessionId}", sessionId);
                    return Ok(new { isValid = true });
                }
                _logger.LogWarning("No valid token found for session ID: {SessionId}", sessionId);
            }
            else
            {
                _logger.LogWarning("No session cookie found");
            }
            
            _logger.LogInformation("No valid session found");
            return Ok(new { isValid = false });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var sessionId = Request.Cookies[SESSION_COOKIE_NAME];
            _logger.LogInformation("Logging out. Session ID: {SessionId}", sessionId);
            
            // Clear the session cookie
            Response.Cookies.Delete(SESSION_COOKIE_NAME);
            
            return Ok();
        }

        [HttpGet("character")]
        public async Task<IActionResult> GetCharacterInfo()
        {
            var sessionId = Request.Cookies[SESSION_COOKIE_NAME];
            _logger.LogInformation("Getting character info for session ID: {SessionId}", sessionId);
            
            if (string.IsNullOrEmpty(sessionId))
            {
                _logger.LogWarning("No session cookie found");
                return Unauthorized("No valid session found");
            }

            try
            {
                var characterInfo = await _authService.GetCharacterInfoAsync(sessionId);
                if (characterInfo == null)
                {
                    _logger.LogWarning("No character info found for session ID: {SessionId}", sessionId);
                    return Unauthorized("Invalid session");
                }

                _logger.LogInformation("Successfully retrieved character info for session ID: {SessionId}", sessionId);
                return Ok(characterInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting character info for session ID: {SessionId}", sessionId);
                return StatusCode(500, "Error retrieving character info");
            }
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
}