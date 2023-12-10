import { useEffect, useState } from 'react';
import StackTree from './components/drag-tree';

import s from './style.scss';
import actions from '@/qiankun/actions';

const Home = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        actions.onGlobalStateChange((state) => {
            const { userInfo } = state || {};
            setIsAdmin(!!userInfo?.username);
        }, true);
    }, []);
    return (
        <div className={s.layout}>
            <div className={s.search}></div>
            <div className={s.content}>
                <div className={s.tree}>
                    <StackTree isAdmin={isAdmin} />
                </div>
            </div>
        </div>
    );
};
export default Home;
