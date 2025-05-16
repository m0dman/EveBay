using System.Collections.Generic;

namespace EveBay.API.Models
{
    public class EveOnlineSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string CallbackUrl { get; set; }
        public string[] Scopes { get; set; }
    }
} 