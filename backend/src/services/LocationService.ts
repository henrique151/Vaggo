import State from "../models/State";
import City from "../models/City";

export class LocationService {
    static async getStates() {
        return State.findAll({ order: [['EST_STR_NOME', 'ASC']] });
    }

    static async getCitiesByState(stateId: number) {
        const state = await State.findByPk(stateId);
        if (!state) throw new Error('STATE_NOT_FOUND');

        return City.findAll({
            where: { stateId },
            order: [['name', 'ASC']],
            attributes: { exclude: ['EST_INT_ID'] },
        });
    }
} 