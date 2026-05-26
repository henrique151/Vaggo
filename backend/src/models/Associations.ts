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
import Conversation from "./Conversation";
import Message from "./Message";
import BlockedUser from "./BlockedUser";

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

    PropertyUser.belongsTo(Property, { foreignKey: 'PRO_INT_ID', as: 'property' });
    Property.hasMany(PropertyUser, { foreignKey: 'PRO_INT_ID', as: 'propertyUsers' });

    PropertyUser.belongsTo(User, { foreignKey: 'USU_INT_ID', as: 'user' });
    User.hasMany(PropertyUser, { foreignKey: 'USU_INT_ID', as: 'propertyUsers' });

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

    // 8. Reviews (User, Property, Spot and Reservation)
    User.hasMany(Review, { foreignKey: 'USU_INT_ID', as: 'reviews' });
    Review.belongsTo(User, { foreignKey: 'USU_INT_ID', as: 'author' });

    Property.hasMany(Review, { foreignKey: 'PRO_INT_ID', as: 'reviews' });
    Review.belongsTo(Property, { foreignKey: 'PRO_INT_ID', as: 'property' });

    Spot.hasMany(Review, { foreignKey: 'VAG_INT_ID', as: 'reviews' });
    Review.belongsTo(Spot, { foreignKey: 'VAG_INT_ID', as: 'spot' });

    Reservation.hasMany(Review, { foreignKey: 'RES_INT_ID', as: 'reviews' });
    Review.belongsTo(Reservation, { foreignKey: 'RES_INT_ID', as: 'reservation' });

    // 9. Reports (User and Spot)
    User.hasMany(Report, { foreignKey: 'USU_INT_ID', as: 'reports' });
    Report.belongsTo(User, { foreignKey: 'USU_INT_ID', as: 'reporter' });

    Spot.hasMany(Report, { foreignKey: 'VAG_INT_ID', as: 'reports' });
    Report.belongsTo(Spot, { foreignKey: 'VAG_INT_ID', as: 'spot' });

    // 10. Internal chat
    Reservation.hasMany(Conversation, { foreignKey: 'RES_INT_ID', as: 'conversations' });
    Conversation.belongsTo(Reservation, { foreignKey: 'RES_INT_ID', as: 'solicitation' });

    Property.hasMany(Conversation, { foreignKey: 'PRO_INT_ID', as: 'conversations' });
    Conversation.belongsTo(Property, { foreignKey: 'PRO_INT_ID', as: 'property' });

    User.hasMany(Conversation, { foreignKey: 'USU_INT_SOLICITANTE_ID', as: 'requestedConversations' });
    Conversation.belongsTo(User, { foreignKey: 'USU_INT_SOLICITANTE_ID', as: 'requester' });

    User.hasMany(Conversation, { foreignKey: 'USU_INT_DONO_ID', as: 'ownedConversations' });
    Conversation.belongsTo(User, { foreignKey: 'USU_INT_DONO_ID', as: 'owner' });

    Conversation.hasMany(Message, { foreignKey: 'CON_INT_ID', as: 'messages' });
    Message.belongsTo(Conversation, { foreignKey: 'CON_INT_ID', as: 'conversation' });

    User.hasMany(Message, { foreignKey: 'USU_INT_REMETENTE_ID', as: 'sentMessages' });
    Message.belongsTo(User, { foreignKey: 'USU_INT_REMETENTE_ID', as: 'sender' });

    User.hasMany(BlockedUser, { foreignKey: 'USU_INT_BLOCKER_ID', as: 'blockedUsers' });
    BlockedUser.belongsTo(User, { foreignKey: 'USU_INT_BLOCKER_ID', as: 'blocker' });

    User.hasMany(BlockedUser, { foreignKey: 'USU_INT_BLOCKED_ID', as: 'blockedByUsers' });
    BlockedUser.belongsTo(User, { foreignKey: 'USU_INT_BLOCKED_ID', as: 'blocked' });
}

export default setupAssociantos
