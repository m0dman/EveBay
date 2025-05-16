using System.Text.Json.Serialization;

namespace EveBay.API.Models
{
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

        public string ItemName { get; set; }
    }
} 