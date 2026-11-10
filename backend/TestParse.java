import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
public class TestParse {
    public static void main(String[] args) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = "[[20.1, 85.1], [20.2, 85]]";
            List<List<Double>> geom = mapper.readValue(json, mapper.getTypeFactory().constructCollectionType(List.class, mapper.getTypeFactory().constructCollectionType(List.class, Double.class)));
            System.out.println("Success: " + geom);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
