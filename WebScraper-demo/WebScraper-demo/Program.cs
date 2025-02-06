using Newtonsoft.Json;

class Program
{
    static async Task Main()
    {
        string apiKey = "8cc9204995954a2f973c32132a2f6c08cb6318301068631545edfdae5ba8911e"; // Replace with your actual SerpAPI key
        string url = $"https://serpapi.com/search.json?engine=yelp&find_desc=Secondhand+Stores&find_loc=Malmö&api_key={apiKey}";

        var httpClient = new HttpClient();
        var response = await httpClient.GetStringAsync(url);
        var data = JsonConvert.DeserializeObject<SerpApiResponse>(response);

        if (data == null || data.OrganicResults == null || data.OrganicResults.Count == 0)
        {
            Console.WriteLine("❌ No data retrieved from SerpAPI.");
            return;
        }

        var stores = new List<Store>();

        foreach (var result in data.OrganicResults)
        {
            Console.WriteLine($"🌍 Fetching details for: {result.Title}...");

            // 🔹 Get more business details using SerpAPI
            var (address, website) = await GetBusinessDetailsFromSerpAPI(apiKey, result.PlaceId);

            // 🌍 Convert address to coordinates
            var (lat, lon) = await Geocoder.GetCoordinates(address);

            stores.Add(new Store
            {
                Name = result.Title,
                Address = address,
                Latitude = lat,
                Longitude = lon,
                Website = website,
                YelpPage = result.Link,
                Phone = result.Phone ?? "Not provided"
            });

            Console.WriteLine($"📍 {result.Title} -> {lat}, {lon} | 🌐 Website: {website}");
        }

        // 💾 Save as JSON
        string json = JsonConvert.SerializeObject(stores, Formatting.Indented);
        File.WriteAllText("stores.json", json);

        Console.WriteLine("✅ Scraping complete! Data saved to stores.json.");
    }

    // 🔹 Get detailed business info using SerpAPI (instead of scraping manually)
    public static async Task<(string, string)> GetBusinessDetailsFromSerpAPI(string apiKey, string placeId)
    {
        if (string.IsNullOrWhiteSpace(placeId))
            return ("Address not found", "Website not found");

        // 🔹 Corrected API Request
        string businessUrl = $"https://serpapi.com/search.json?engine=yelp_reviews&num=1&place_id={placeId}&api_key={apiKey}";

        Console.WriteLine($"🔹 Fetching Business Details from: {businessUrl}");

        var httpClient = new HttpClient();
        var response = await httpClient.GetAsync(businessUrl);

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"❌ API Request Failed: {response.StatusCode}");
            string errorDetails = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"🔹 Error Message: {errorDetails}");
            return ("Address not found", "Website not found");
        }

        string jsonResponse = await response.Content.ReadAsStringAsync();
        var businessData = JsonConvert.DeserializeObject<SerpApiBusinessResponse>(jsonResponse);

        if (businessData == null)
            return ("Address not found", "Website not found");

        string address = businessData.Address ?? "Address not found";
        string website = businessData.Website ?? "Website not found";

        return (address, website);
    }
}

// ✅ SerpAPI Response Models
class SerpApiResponse
{
    [JsonProperty("organic_results")]
    public List<SerpApiOrganicResult> OrganicResults { get; set; }
}

class SerpApiOrganicResult
{
    [JsonProperty("title")]
    public string Title { get; set; }

    [JsonProperty("link")]
    public string Link { get; set; }

    [JsonProperty("phone")]
    public string Phone { get; set; }

    [JsonProperty("place_ids")]
    public List<string> PlaceIds { get; set; }

    public string PlaceId => PlaceIds?.Count > 0 ? PlaceIds[0] : null;
}

// ✅ Business Details Response Model
class SerpApiBusinessResponse
{
    [JsonProperty("address")]
    public string Address { get; set; }

    [JsonProperty("website")]
    public string Website { get; set; }
}

// ✅ Store class
class Store
{
    public string Name { get; set; }
    public string Address { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Website { get; set; }
    public string YelpPage { get; set; }
    public string Phone { get; set; }
}

// ✅ Geocoder (Converts Address -> Lat/Lon)
public static class Geocoder
{
    public static async Task<(double, double)> GetCoordinates(string address)
    {
        if (string.IsNullOrWhiteSpace(address) || address == "Address not found") return (0, 0);

        string url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(address)}";

        using var client = new HttpClient();
        var response = await client.GetStringAsync(url);
        var data = JsonConvert.DeserializeObject<dynamic>(response);

        if (data.Count > 0)
        {
            double lat = (double)data[0].lat;
            double lon = (double)data[0].lon;
            return (lat, lon);
        }

        return (0, 0); // Default if geocoding fails
    }
}
