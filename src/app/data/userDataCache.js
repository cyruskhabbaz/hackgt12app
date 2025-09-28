class UserCache {
    static allUserCaches = {};
    static createNewUser(email, name) {
        let newUser = {
            profile: {name, email},
            linkedSource: [],
            suggestedEvents: [],
            chat: {
                botToUser: [
                    {
                        time: 0,
                        content: "Hello!"
                    }
                ],
                userToBot: [
                    {
                        time: 0,
                        content: ""
                    }
                ],
            }
        };
        return newUser;
    }
}

export { UserCache };

/*

structure of each user's database entry:

userid {
    profile: {
        name: string
        email: string
    }
    linkedSources: [
        {
            name: string
            accessToken: string
        }
    ]
    suggestedEvents: [
        (Event)
    ]
}

structure types:
(Event) {
    start: number <-- represents a date
    end: number <-- represents a date
}

*/