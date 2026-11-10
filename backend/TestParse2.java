import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.ArrayList;

public class TestParse2 {
    public static void main(String[] args) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = "[[19.069,83.81],[19.07,83.81]]";
            List<List<Double>> geom = new ArrayList<>();
            List<?> rawList = mapper.readValue(json, List.class);
            for (Object obj : rawList) {
                if (obj instanceof List) {
                    List<?> pt = (List<?>) obj;
                    if (pt.size() >= 2) {
                        Double lat = ((Number) pt.get(0)).doubleValue();
                        Double lng = ((Number) pt.get(1)).doubleValue();
                        geom.add(List.of(lat, lng));
                    }
                }
            }
            System.out.println("Geom: " + geom);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
