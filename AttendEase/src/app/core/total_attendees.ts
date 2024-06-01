export interface TotalAttendeesResponse {
  status: {
    remarks: string;
    message: string;
  };
  payload: number;
  timestamp: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
}
