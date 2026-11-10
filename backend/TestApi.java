import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class TestApi {
    public static void main(String[] args) throws Exception {
        // Need to login first to get token
        HttpClient client = HttpClient.newHttpClient();
        String loginJson = "{\"email\":\"somennayak23@gmail.com\",\"password\":\"somennayak23\"}";
        HttpRequest req1 = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(loginJson))
                .build();
        HttpResponse<String> res1 = client.send(req1, HttpResponse.BodyHandlers.ofString());
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> resMap = mapper.readValue(res1.body(), Map.class);
        String token = (String) resMap.get("token");
        System.out.println("Token: " + token);

        HttpRequest req2 = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/journeys"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> res2 = client.send(req2, HttpResponse.BodyHandlers.ofString());
        System.out.println("Journeys: " + res2.body().substring(0, Math.min(2000, res2.body().length())));
    }
}
