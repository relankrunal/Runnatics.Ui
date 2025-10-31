export class Environments {
    name: string;
    prefix: string;

    constructor(name: string, prefix: string) {
        this.name = name;
        this.prefix = prefix;
    }
    static Local = new Environments("local", "dev.localhost");
    static Development = new Environments("development", "dev.api.runnatics.com");
    static Staging = new Environments("staging", "staging.api.runnatics.com");
    static Production = new Environments("production", "api.runnatics.com");

    static getCurrent(): Environments {
        const env = window.location.hostname;
        switch (env) {
            case "development":
                return Environments.Development;
            case "staging":
                return Environments.Staging;
            case "production":
                return Environments.Production;
            default:
                return Environments.Local;
        }
    }
}