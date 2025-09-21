import React from 'react';

const Spinner: React.FC = () => {
    // The new loader CSS is defined globally in index.html.
    // This component scales down the loader to fit into small spaces like buttons.
    return (
        <div style={{
            width: '32px',
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{ transform: 'scale(0.25)', transformOrigin: 'center' }}>
                <div className="book">
                    <div className="book__pg-shadow"></div>
                    <div className="book__pg"></div>
                    <div className="book__pg book__pg--2"></div>
                    <div className="book__pg book__pg--3"></div>
                    <div className="book__pg book__pg--4"></div>
                    <div className="book__pg book__pg--5"></div>
                </div>
            </div>
        </div>
    );
};

export default Spinner;