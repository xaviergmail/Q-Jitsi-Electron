import React, { useState } from 'react';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
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