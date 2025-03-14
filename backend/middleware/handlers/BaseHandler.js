class BaseHandler {
    constructor(){
        this.nextHandler = null;
    }
    setNext(handler){
        this.nextHandler = handler;
        return handler;
    }

    async handle(req){
        if(this.nextHandler){
            return await this.nextHandler.handle(req);
        }
        return true;
    }
}
module.exports = BaseHandler;