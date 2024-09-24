export class Brand {
    public static readonly VOLKSWAGEN = new Brand('VW_11', 2, './assets/images/brands/volkswagen.svg');
    public static readonly AUDI = new Brand('AUDI', 3, './assets/images/brands/audi.svg');
    public static readonly SEAT = new Brand('SEAT', 4, './assets/images/brands/seat-2.svg');
    public static readonly SKODA = new Brand('SKODA', 5, './assets/images/brands/skoda1.svg');
    public static readonly PORSCHE = new Brand('PORSCHE', 6, './assets/images/brands/porsche-svg.svg');
    public static readonly MAN = new Brand('MAN', 7, './assets/images/brands/Man.svg');

    private static brandMap: { [key: number]: Brand };

    private constructor(private name: string, private id: number, private logo: string) {
        if (!Brand.brandMap) {
            Brand.brandMap = {};
        }
        Brand.brandMap[id] = this;
    }

    public getName(): string {
        return this.name;
    }

    public getID(): number {
        return this.id;
    }

    public getLogo(): string {
        return this.logo;
    }

    public static getBrand(id: number): Brand {
        return Brand.brandMap[id];
    }

    public static getAllBrands(): Brand[] {
        return Object.values(Brand.brandMap);
    }
}
