class ErrorClass extends Error{
    constructor(message,status){
        super(message);
        this.status=(status || 500)
    }
}

export default ErrorClass;