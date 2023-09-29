export const INLINE_QUERY = {
    makeAppointment: 'make_appointment_query',
    selectService: 'select_service_query',
    selectDate: 'select_date_query',
};

export enum ServiceOption {
    Min = 'min',
    Medium = 'medium',
    Normal = 'normal',
    Max = 'max',
}

export const ServiceByOption = {
    [ServiceOption.Min]: 'Маникюр (от 25€)',
    [ServiceOption.Medium]: 'Маникюр + покрытие (от 40€)',
    [ServiceOption.Normal]: 'Наращивание ногтей 1-2 (от 50€)',
    [ServiceOption.Max]: 'Наращивание ногтей 3-4 (от 60€)',
} as const;
