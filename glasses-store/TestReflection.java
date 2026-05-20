import java.lang.reflect.Method;
public class TestReflection {
    public static void main(String[] args) throws Exception {
        Class<?> c = Class.forName("vn.payos.service.blocking.webhooks.WebhooksService");
        for(Method m : c.getMethods()) {
            if(m.getName().equals("verify")) {
                System.out.println(m);
            }
        }
    }
}
