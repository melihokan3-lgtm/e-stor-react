import React from 'react'

const PremiumProductCard = ({ bg, item }) => {
    console.log(item);

    return (
        <div className={bg}>
            <img src='' alt='asd' />;
            <h4>{item}</h4>
            <span>By grouc</span>
            <div>
                <p>9,99</p>
                <span>11.99</span>
            </div>
            <button>Add to chart</button>
        </div>
    )
}

export default PremiumProductCard;