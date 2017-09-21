/*
 *
 *  Hi!
 *  This is example of src file to show you how aphs blocks look like
 *  It was created on first start of aphs. You can delete it anytime
 *
 * -----------------------
 *
 *  How aphs work:
 *
 *  You can find two functions below. They are wrapped with opening and closing marks
 *  using individual block names "sourceBlockExample" and "targetBlockExample"
 *
 *  After you wrapped any code blocks like these you can click button "Scan for new blocks"
 *  in the client and get these new blocks listed in the general list of all the blocks of the project
 *  (you can find it in the file aphs.json in the root of the project)
 *  after that they will be available to add to any context
 *
 *  Connections are made in context editor, not in code. Only blocks set like these.
 *
 */




/*-sourceBlockExample-*/
function thisIsMyFunction() {
    var myVariable = getMyVariable();
}
/*-/sourceBlockExample-*/



/*-targetBlockExample-*/
function getMyVariable() {
    return "Hey, here is some string variable for you";
}
/*-/targetBlockExample-*/
