import State from "./State";
import City from "./City";
import Address from "./Address";
import Person from "./Person";
import User from "./User";
import Vehicle from "./Vehicle";
import Property from "./Property";
import PropertyUser from "./PropertyUser";
import Spot from "./Spot";
import Reservation from "./Reservation";
import Review from "./Review";
import Report from "./Report";
import SpotAvailability from './SpotAvailabilities';

const setupAssociantos = () => {
    // 1. Location Relationship (State -> City -> Address)
    State.hasMany(City, { foreignKey: 'EST_INT_ID', as: 'cities' });
    City.belongsTo(State, { foreignKey: 'EST_INT_ID', as: 'state' });

    City.hasMany(Address, { foreignKey: 'CID_INT_ID', as: 'addresses' });
    Address.belongsTo(City, { foreignKey: 'CID_INT_ID', as: 'city' });

    // 2. Person and User (1:1 Relationship)
    User.belongsTo(Person, { foreignKey: 'PES_INT_ID', as: 'person' });
    Person.hasOne(User, { foreignKey: 'PES_INT_ID', as: 'user' });

    // 3. Property and Address (1:N)
    Address.hasMany(Property, { foreignKey: 'END_INT_ID', as: 'properties' });
    Property.belongsTo(Address, { foreignKey: 'END_INT_ID', as: 'address' });

    // 4. Property and User (N:M via PropertyUser)
    User.belongsToMany(Property, {
        through: PropertyUser,
        foreignKey: 'USU_INT_ID',
        otherKey: 'PRO_INT_ID',
        as: 'ownedOrInhabitedProperties'
    });
    Property.belongsToMany(User, {
        through: PropertyUser,
        foreignKey: 'PRO_INT_ID',
        otherKey: 'USU_INT_ID',
        as: 'residentsAndOwners'
    });

    // 5. Property and Spot (1:N)
    Property.hasMany(Spot, { foreignKey: 'PRO_INT_ID', as: 'spots' });
    Spot.belongsTo(Property, { foreignKey: 'PRO_INT_ID', as: 'property' });

    // 6. User and Vehicle (1:N)
    User.hasMany(Vehicle, { foreignKey: 'USU_INT_ID', as: 'vehicles' });
    Vehicle.belongsTo(User, { foreignKey: 'USU_INT_ID', as: 'user' });
 
    // Spot 1:1 SpotAvailability
    Spot.hasOne(SpotAvailability, { foreignKey: 'VAG_INT_ID', as: 'availability' });
    SpotAvailability.belongsTo(Spot, { foreignKey: 'VAG_INT_ID', as: 'spot' });

    // 7. Reservation Relationships (Vehicle and Spot)

    Spot.hasMany(Reservation, { foreignKey: 'VAG_INT_ID', as: 'reservations' });
    Reservation.belongsTo(Spot, { foreignKey: 'VAG_INT_ID', as: 'spot' });

    Vehicle.hasMany(Reservation, { foreignKey: 'VEI_INT_ID', as: 'reservations' });
    Reservation.belongsTo(Vehicle, { foreignKey: 'VEI_INT_ID', as: 'vehicle' });

    User.hasMany(Reservation, { foreignKey: 'USU_INT_ID', as: 'reservations' });
    Reservation.belongsTo(User, { foreignKey: 'USU_INT_ID', as: 'user' });

    // 8. Reviews (User and Property)
    User.hasMany(Review, { foreignKey: 'USU_INT_ID', as: 'reviews' });
    Review.belongsTo(User, { foreignKey: 'USU_INT_ID', as: 'author' });

    Property.hasMany(Review, { foreignKey: 'PRO_INT_ID', as: 'reviews' });
    Review.belongsTo(Property, { foreignKey: 'PRO_INT_ID', as: 'property' });

    // 9. Reports (User and Property)
    User.hasMany(Report, { foreignKey: 'USU_INT_ID', as: 'reports' });
    Report.belongsTo(User, { foreignKey: 'USU_INT_ID', as: 'reporter' });

    Property.hasMany(Report, { foreignKey: 'PRO_INT_ID', as: 'reports' });
    Report.belongsTo(Property, { foreignKey: 'PRO_INT_ID', as: 'property' });
}

export default setupAssociantos