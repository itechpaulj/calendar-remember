import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: null,
    user: null,
    modal: false,
    data: [],
};

export const userSlice = createSlice({
    name: "remember",
    initialState,
    reducers: {
        authentication: (state, action) => {
            const { user_id, token_id } = action.payload;
            state.user = user_id;
            state.token = token_id;
        },
        modal: (state, action) => {
            state.modal = action.payload;
        },
        load: (state, action) => {
            if (state.data instanceof Array) {
                state.data = action.payload;
            }
        },
        create: (state, action) => {
            if (state.data instanceof Array) {
                state.data.push(action.payload);
            }
        },
        update: (state, action) => {
            if (state.data instanceof Array) {
                let getUpdate = state.data
                    .slice()
                    .map((value) => {
                        const objectEntries = Object.entries(action.payload);
                        // eslint-disable-next-line no-unused-vars
                        for (let [_, object] of objectEntries) {
                            if (`${object.id}` === `${value.id}`) {
                                return {
                                    ...value,
                                    title: object.title,
                                    description: object.description,
                                    className: object.className,
                                    status: object.status,
                                };
                            }

                            if (`${object.id}` !== `${value.id}`) {
                                return {
                                    ...value,
                                };
                            }
                        }
                    })
                    .filter((elem) => elem);
                state.data = getUpdate;
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const { authentication, modal, load, create, update } =
    userSlice.actions;

export default userSlice.reducer;
