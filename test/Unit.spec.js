describe('Unit', () => {

    let unit;

    beforeEach(function() {
        unit = new Unit(null);
    });

    describe('setType', () => {
        it('should set the unit graphic to lightblue with size 1 when type is fish', () => {
            let type = 'fish';
            let setGraphicSpy = spyOn(unit, 'setGraphic');            

            unit.setType(type);

            expect(setGraphicSpy).toHaveBeenCalledWith('lightblue', 1);
        });
    });

    describe('setGraphic', () => {
        it('should set the unit color with the color in parameters', () => {
            let color = 'sjfsdofijosd';

            unit.setGraphic(color, 0);

            expect(unit.color).toBe(color);
        });

        it('should set the unit size with the size in parameters', () => {
            let size = 9999;

            unit.setGraphic('sdjsd', size);

            expect(unit.size).toBe(size);
        });
    });
    
});
