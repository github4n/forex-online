
import state from './states'
import mutations from './mutations'
import actions from './actions'
var forex = {
	namespaced: true,
    state,
    mutations,
    actions,
}
export default forex;