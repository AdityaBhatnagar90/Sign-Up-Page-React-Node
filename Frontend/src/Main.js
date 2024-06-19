//Main.js

import './Main.css'

function Main(){
    return(
        <div className="main">
            <form action="http://localhost:4000/login" method="POST">
                <label>Username</label><br/>
                <input type="text" name ='userid'/> <br/>
                <label>Password</label> <br/>
                <input type="text" name='password'/> <br/>
                <input type="submit" value='submit'/>
            </form>
        </div>
    )
}

export default Main;