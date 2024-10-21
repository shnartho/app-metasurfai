import React from 'react';

const About = () => {
    return (
        <div className='about-container'>
            <h2 className='about-heading font-bold'>Decentralized Advertisement Platform</h2>
            <p className='pt-8'>
                MetaSurfAI is transforming advertising through decentralization. MetaSurfAI guarantees real user engagement, where users receive cryptocurrency as a reward for each advertisement viewed. The audience can also reuse their own cryptocurrency to publish ads or store it as an asset. Companies, small businesses, or individuals wanting real audience interaction can publish ads anonymously here, unlike platforms like YouTube or social media, where ads often blend in with content and go unnoticed.
            </p>
            <h3 className='about-subheading font-bold pt-8'>What's new about MetaSurfAI?</h3>
            <div>
                <h4 className='about-subheading font-bold pt-6'>Advertise Anonymously</h4>
                <p className='pt-4'>
                    Advertise anything anonymously with no restrictions, terms, credit card, or debit card requirements on a fully decentralized platform.
                </p>
            </div>
            <div>
                <h4 className='about-subheading font-bold pt-6'>Decentralized Platform</h4>
                <p className='pt-4'>
                    Ensuring robust user engagement with advertisements through a fully dedicated decentralized advertising platform.
                </p>
            </div>
        </div>
    );
};

export default About;