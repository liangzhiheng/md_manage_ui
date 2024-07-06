var BaseURL = "http://127.0.0.1:3000";

export var Apis = {
    user: {
        register: BaseURL + "/user/register",
        login: BaseURL + "/user/login",
        logout: BaseURL + "/user/logout",
        self: BaseURL + "/user/self",
        self_avatar: BaseURL + "/user/self/avatar",
        manage: BaseURL + "/user/manage",
        manage_avatar: BaseURL + "/user/avatar",
    }
};