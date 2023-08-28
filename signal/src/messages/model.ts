
// include external libraries
import mongoose, { Schema } from 'mongoose'



const messageSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true,
    },
    
    to: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
    },
    
    from: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
    },

    sentAt: {
        type: Date,
        default: Date.now()
    },

    deliveredAt: {
        type: Date,
        default: Date.now()
    },
    
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    
}, {
    collation: { locale: 'en_US', strength: 2 }
})


const MessagesModel = mongoose.model('Messages', messageSchema)
export default MessagesModel