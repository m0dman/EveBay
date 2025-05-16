using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EveBay.API.Services;
using EveBay.API.Models;
using Microsoft.Extensions.Logging;

namespace EveBay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractsController : ControllerBase
    {
        private readonly IEveOnlineAuthService _authService;
        private readonly IEveOnlineContractsService _contractsService;
        private readonly ILogger<ContractsController> _logger;
        private const string SESSION_COOKIE_NAME = "evebay_session_id";
        private const int LUX_MUNDI_CORPORATION_ID = 98665606;

        public ContractsController(
            IEveOnlineAuthService authService,
            IEveOnlineContractsService contractsService,
            ILogger<ContractsController> logger)
        {
            _authService = authService;
            _contractsService = contractsService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetContracts([FromQuery] bool includeFinished = false)
        {
            var sessionId = Request.Cookies[SESSION_COOKIE_NAME];
            _logger.LogInformation("Getting contracts for session ID: {SessionId}, includeFinished: {IncludeFinished}", 
                sessionId, includeFinished);

            if (string.IsNullOrEmpty(sessionId))
            {
                _logger.LogWarning("No session cookie found");
                return Unauthorized(new { message = "No session found" });
            }

            try
            {
                var token = await _authService.GetAccessTokenAsync(sessionId);
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("No valid token found for session ID: {SessionId}", sessionId);
                    return Unauthorized(new { message = "Invalid session" });
                }

                _logger.LogInformation("Successfully retrieved access token for session ID: {SessionId}", sessionId);
                var contracts = await _contractsService.GetCorporationContractsAsync(LUX_MUNDI_CORPORATION_ID, token, includeFinished);
                return Ok(contracts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contracts");
                return StatusCode(500, new { message = "Failed to get contracts" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContractDetails(int id)
        {
            var sessionId = Request.Cookies[SESSION_COOKIE_NAME];
            _logger.LogInformation("Getting details for contract {ContractId} for session ID: {SessionId}", id, sessionId);

            if (string.IsNullOrEmpty(sessionId))
            {
                _logger.LogWarning("No session cookie found");
                return Unauthorized(new { message = "No session found" });
            }

            try
            {
                var token = await _authService.GetAccessTokenAsync(sessionId);
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("No valid token found for session ID: {SessionId}", sessionId);
                    return Unauthorized(new { message = "Invalid session" });
                }

                _logger.LogInformation("Successfully retrieved access token for session ID: {SessionId}", sessionId);
                var contract = await _contractsService.GetContractDetailsAsync(id, token);
                if (contract == null)
                {
                    return NotFound(new { message = "Contract not found" });
                }
                return Ok(contract);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contract details");
                return StatusCode(500, new { message = "Failed to get contract details" });
            }
        }

        [HttpGet("{id}/items")]
        public async Task<IActionResult> GetContractItems(int id)
        {
            var sessionId = Request.Cookies[SESSION_COOKIE_NAME];
            _logger.LogInformation("Getting items for contract {ContractId} for session ID: {SessionId}", id, sessionId);

            if (string.IsNullOrEmpty(sessionId))
            {
                _logger.LogWarning("No session cookie found");
                return Unauthorized(new { message = "No session found" });
            }

            try
            {
                var token = await _authService.GetAccessTokenAsync(sessionId);
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("No valid token found for session ID: {SessionId}", sessionId);
                    return Unauthorized(new { message = "Invalid session" });
                }

                _logger.LogInformation("Successfully retrieved access token for session ID: {SessionId}", sessionId);
                var items = await _contractsService.GetContractItemsAsync(id, token);
                if (items == null || !items.Any())
                {
                    return NotFound(new { message = "No items found for this contract" });
                }
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contract items");
                return StatusCode(500, new { message = "Failed to get contract items" });
            }
        }
    }
} 