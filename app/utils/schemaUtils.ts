import { Schema, SchemaType } from "mongoose"


export type SType = String | Number | Boolean;


export class SchemaBuilder {
    req: boolean = false;
    reqMsg: string = "";
    defValue: any = null;
    uni: boolean = false;
    ref: string = "";



    required(r: boolean, msg: string = "") {
        this.req = r;
        this.reqMsg = msg;
        return this;
    }

    default(v: any) {
        this.defValue = v;
        return this;
    }

    unique(u: boolean) {
        this.uni = u;
        return this;
    }

    references(r: string) {
        this.ref = r;
        return this;
    }

    build() {
        return {
            required: this.req === true ? [true, this.reqMsg] : false,
            default: this.defValue,
            unique: this.uni,
            ref: this.ref,
        };
    }
}


