import React from 'react'

function Form() {
  return (
    <div>
        <form action="">
          <label htmlFor="">Lastname</label>
          <input type="text" placeholder='Lastname' required/>

          <label htmlFor="">Firstname</label>
          <input type="text" placeholder='Firstname' required/>

          <label htmlFor="">Middle Name</label>
          <input type="text" placeholder='M.N' required/>

          <label htmlFor="">Age</label>
          <input type="number" placeholder='Age' required/>

          <label htmlFor="">Qualifier</label>
          <input type="text" placeholder='Qualifier' required/>

          <label htmlFor="">CP #</label>
          <input type="number" placeholder='CP #' required/>

          <label htmlFor="">Course</label>
          <input type="text" placeholder='Course' required/>

          <label htmlFor="">Date Graduated</label>
          <input type="date" placeholder='Date Graduated' required/>

          <label htmlFor="">Name of School</label>
          <input type="text" placeholder='Name of School' required/>

          <label htmlFor="">Latin Honor</label>
          <input type="text" placeholder='Latin Honor'/>
          
          <label htmlFor="">Eligibility (PRC,CSC,NAP,PD907)</label>
          <input type="text" placeholder='Eligibility' required/>

          <label htmlFor="">Eligibility Rating</label>
          <input type="text" placeholder='Eligibility Rating'/>

          <label htmlFor="">Pag-ibig #</label>
          <input type="number" placeholder='Pag-ibig #' required/>

          <label htmlFor="">PhilHealth ID#</label>
          <input type="number" placeholder='PhilHealth ID#' required/>

          <label htmlFor="">Heigth eg.(160cm)</label>
          <input type="text" placeholder='Height' required/>

          <label htmlFor="">Waiver</label>
          <input type="text" placeholder='Waiver'/>

          <label htmlFor="">Tribe Affiliated</label>
          <input type="text" placeholder='Tribe Affiliated' required/>

          <button type="submit">Submit</button>

        </form>
    </div>
  )
}

export default Form
