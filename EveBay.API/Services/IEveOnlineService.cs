using System.Collections.Generic;
using System.Threading.Tasks;
using EveBay.API.Models;

namespace EveBay.API.Services
{
    public interface IEveOnlineService
    {
        Task<IEnumerable<Contract>> GetCorporationContractsAsync(int corporationId, string sessionId);
        Task<Contract> GetContractDetailsAsync(int contractId, string sessionId);
    }
} 