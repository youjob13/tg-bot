import * as DTO from '../../dto/index.js';

// if user don't answer, request will in progress until server down
// maybe it makes sense to store in db
export const userCurrentRequestState = new Map<number, DTO.RequestState>();
