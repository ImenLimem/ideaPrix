package IdealPrix.model;

public enum Devise {

    DINAR_TUNISIEN("TND"),
    DOLLAR("$"),
    EURO("€");

    private final String symbole;

    Devise(String symbole) {
        this.symbole = symbole;
    }

    public String getSymbole() {
        return symbole;
    }
}
