/**
 * @name 未命名
 */
import React from 'react';
import './style.css';

const displayName = "未命名";

export default function WaitingGeneration() {
    return (
        <main className="prototype-waiting-generation-page" aria-label={displayName}>
            <span>正在等待生成</span>
        </main>
    );
}
