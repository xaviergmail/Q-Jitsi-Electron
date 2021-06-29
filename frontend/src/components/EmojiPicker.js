import React, { useState } from 'react';
import 'emoji-mart/css/emoji-mart.css'
import { Picker, emojiIndex, store, Emoji } from 'emoji-mart'


console.log('huh', store)

console.log(store.get('last'))



emojiIndex.search('happy').map((o) => {
    console.log(o.native)
})

//"{"+1":11,"grinning":8,"kissing_heart":7,"heart_eyes":6,"laughing":5,"stuck_out_tongue_winking_eye":4,"sweat_smile":3,"joy":5,"scream":1,"upside_down_face":1,"star-struck":1,"blush":1}"


// import Picker from 'emoji-picker-react';

// const EmojiPicker = ({ saveReaction, setShowReactions }) => {
//     // const [chosenEmoji, setChosenEmoji] = useState(null);

//     const onEmojiClick = (event, emojiObject) => {
//         // setChosenEmoji(emojiObject);
//         setShowReactions(false)
//         saveReaction(emojiObject)
//     };

//     return (
//         <div className="emojis">

//             {/* <button onClick={() => setShowReactions(false)}>Cancel</button> */}
//             {/* {chosenEmoji ? (
//                 <span>You chose: {chosenEmoji.emoji}</span>
//             ) : (
//                 <span>No emoji Chosen</span>
//             )} */}
//             <Picker onEmojiClick={onEmojiClick} />
//         </div>
//     );
// };


const EmojiPicker = ({ saveReaction, setShowReactions }) => {
    const onEmojiClick = (emoji) => {

        console.log(emoji)
        // setChosenEmoji(emoji);
        setShowReactions(false)
        saveReaction(emoji)
    };

    return (
        <div className="emojis">
            <Picker theme="dark" onSelect={onEmojiClick} />

        </div>
    );

}

export default EmojiPicker