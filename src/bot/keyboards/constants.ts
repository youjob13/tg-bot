import { ServiceOption } from '../../../dto/index.js';

export enum InlineQuery {
    MakeAppointment = 'make_appointment_query',
    SelectService = 'select_service_query',
    SelectDate = 'select_date_query',
    ApproveNewRequest = 'approve_new_request_query',
    RejectNewRequest = 'reject_new_request_query',
}

export const ServiceByOption = {
    [ServiceOption.Min]: 'Маникюр (от 25€)',
    [ServiceOption.Medium]: 'Маникюр + покрытие (от 40€)',
    [ServiceOption.Normal]: 'Наращивание ногтей 1-2 (от 50€)',
    [ServiceOption.Max]: 'Наращивание ногтей 3-4 (от 60€)',
} as const;
