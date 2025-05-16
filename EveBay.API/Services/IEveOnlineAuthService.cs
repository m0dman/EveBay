using System.Threading.Tasks;

namespace EveBay.API.Services
{
    public interface IEveOnlineAuthService
    {
        string GetAuthorizationUrl();
        Task<(bool success, string sessionId)> HandleCallbackAsync(string code);
        Task<string> GetAccessTokenAsync(string sessionId);
        Task<CharacterInfo> GetCharacterInfoAsync(string sessionId);
    }
} 