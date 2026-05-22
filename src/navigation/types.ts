export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Otp: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Chat: undefined;
  Complaints: undefined;
  CreateComplaint: undefined;
  ComplaintDetail: { complaintId: string };
  Profile: undefined;
};
