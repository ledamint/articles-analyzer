import { parseMainContent, deleteNonASCIICharacters } from '@reservoir-dogs/html-parser';
import { colorizeEntities } from '../modules/markHTML/markHTML';
import { messenger } from '@reservoir-dogs/browser-transport';
import { extractResponse, extractRequest } from '@reservoir-dogs/browser-transport/src/messages/actions/extract';
import { ParsePageType, parsePageResponse } from '@reservoir-dogs/browser-transport/src/messages/actions/parsePage';

messenger.subscribe(ParsePageType.PARSE_PAGE_REQUEST, async () => {
    const body = document.getElementsByTagName('body')[0];
    const text = parseMainContent(document, location.href);
    const filteredText = deleteNonASCIICharacters(text);

    if (filteredText.length === 0) {
        return;
    }

    const response = await messenger.send<ReturnType<typeof extractResponse>>(extractRequest(filteredText));

    if (!response || !response.payload) {
        return;
    }

    const { FAC, EVENT, GPE, PERSON, PRODUCT, LOC, ORG } = response.payload;

    FAC && colorizeEntities(body, FAC, 'peru');
    EVENT && colorizeEntities(body, EVENT, 'yellow');
    GPE && colorizeEntities(body, GPE, 'violet');
    PERSON && colorizeEntities(body, PERSON, 'magenta');
    PRODUCT && colorizeEntities(body, PRODUCT, 'skyblue');
    LOC && colorizeEntities(body, LOC, 'silver');
    ORG && colorizeEntities(body, ORG, 'mediumorchid');

    return parsePageResponse(response.payload);
});
