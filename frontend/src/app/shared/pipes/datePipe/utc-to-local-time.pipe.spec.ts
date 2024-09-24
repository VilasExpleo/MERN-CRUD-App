import { UtcToLocalTimePipe } from './utc-to-local-time.pipe';
import { UtcToLocalTimeFormat } from 'src/app/shared/models/dashboard-scheduler';

describe('UtcToLocalTimePipe', () => {
    let pipe: UtcToLocalTimePipe;

    beforeEach(() => {
        pipe = new UtcToLocalTimePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('transforms the input UTC date to local time in the short format for a PM time', () => {
        const utcDate = '2023-05-17T12:34:56Z';
        const expectedOutput = '5/17/2023, 2:34\u202FPM';
        const languageGetter = jest.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
        const transformedValue = pipe.transform(utcDate);
        expect(transformedValue).toBe(expectedOutput);
        languageGetter.mockRestore();
    });

    it('transforms the input UTC date to local time in the short format for AM time', () => {
        const utcDate = '2023-05-22T06:12:23.387Z';
        const expectedOutput = '5/22/2023, 8:12\u202FAM';
        const languageGetter = jest.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
        const transformedValue = pipe.transform(utcDate);
        expect(transformedValue).toBe(expectedOutput);
        languageGetter.mockRestore();
    });

    it('transforms the input UTC date to local time in the long format', () => {
        const utcDate = '2023-05-17T10:30:00Z';
        const expectedOutput = new Date(utcDate).toString();

        const transformedValue = pipe.transform(utcDate, UtcToLocalTimeFormat.FULL);

        expect(transformedValue).toEqual(expectedOutput);
    });
});
