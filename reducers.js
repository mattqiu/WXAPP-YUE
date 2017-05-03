export default {
    refreshStates(state ='',action){
        switch (action.type) {
            case 'change_state':
                return action.states
            default:
                return state
        }
    }
}