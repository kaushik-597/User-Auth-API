//this utility is used to standardize the API response which we are getting
//from the API but since the response can skip the statuscode or the data or anything
//maybe because of a mistake or unknowingly then we need to standardize the response right here
//the params in the constructor here are received from the response and this.variables are of class
class ApiResponse {
  constructor(statusCode, data, message = "Successfull response") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
