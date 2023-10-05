import { ServiceOption } from '../../../dto/index.js';
export var InlineQuery;
(function (InlineQuery) {
    InlineQuery["MakeAppointment"] = "make_appointment_query";
    InlineQuery["SelectService"] = "select_service_query";
    InlineQuery["SelectDate"] = "select_date_query";
    InlineQuery["ApproveNewRequest"] = "approve_new_request_query";
    InlineQuery["RejectNewRequest"] = "reject_new_request_query";
})(InlineQuery || (InlineQuery = {}));
export const ServiceByOption = {
    [ServiceOption.Medium]: 'Маникюр + покрытие (от 35€)',
    [ServiceOption.Min]: 'Маникюр (от 25€)',
    [ServiceOption.Normal]: 'Наращивание ногтей 1-2 (от 50€)',
    [ServiceOption.Max]: 'Наращивание ногтей 3-4 (от 60€)',
};
//# sourceMappingURL=constants.js.map