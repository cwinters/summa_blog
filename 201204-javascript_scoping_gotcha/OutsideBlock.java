public class OutsideBlock {
    public static void main( String... args ) {
        for ( int i = 0; i < 5; i++ ) {
            System.out.println( "In loop: " + i );
        }
        System.out.println( "Out of loop: " + i );
    }
}