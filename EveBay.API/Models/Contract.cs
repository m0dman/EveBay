using System;
using System.Text.Json.Serialization;

namespace EveBay.API.Models
{
    public class Contract
    {
        [JsonPropertyName("contract_id")]
        public int ContractId { get; set; }

        [JsonPropertyName("issuer_id")]
        public int IssuerId { get; set; }

        [JsonPropertyName("issuer_corporation_id")]
        public int IssuerCorporationId { get; set; }

        [JsonPropertyName("assignee_id")]
        public int AssigneeId { get; set; }

        [JsonPropertyName("acceptor_id")]
        public int AcceptorId { get; set; }

        [JsonPropertyName("start_location_id")]
        public long StartLocationId { get; set; }

        [JsonPropertyName("end_location_id")]
        public long EndLocationId { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("for_corporation")]
        public bool ForCorporation { get; set; }

        [JsonPropertyName("availability")]
        public string Availability { get; set; }

        [JsonPropertyName("date_issued")]
        public DateTime DateIssued { get; set; }

        [JsonPropertyName("date_expired")]
        public DateTime DateExpired { get; set; }

        [JsonPropertyName("date_accepted")]
        public DateTime? DateAccepted { get; set; }

        [JsonPropertyName("date_completed")]
        public DateTime? DateCompleted { get; set; }

        [JsonPropertyName("days_to_complete")]
        public int DaysToComplete { get; set; }

        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("reward")]
        public decimal Reward { get; set; }

        [JsonPropertyName("collateral")]
        public decimal Collateral { get; set; }

        [JsonPropertyName("buyout")]
        public decimal Buyout { get; set; }

        [JsonPropertyName("volume")]
        public decimal Volume { get; set; }
    }
} 