// Game world
import { EventEmitter as EE } from 'ee-ts';

// World events
interface WorldEvents {
    
}

class World extends EE<WorldEvents> {
    constructor() {
        super();
    }
}