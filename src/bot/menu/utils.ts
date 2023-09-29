import { Menu } from '@grammyjs/menu';

interface IMenuItem {
    text: string;
    noNeedRow?: boolean;
    handler?: any;
}

export const createMenu = (menuName: string, menuItems: Array<IMenuItem>, defaultHandler?: any) => {
    const menu = new Menu(menuName);

    menuItems.forEach(item => {
        menu.text(item.text, item.handler ?? defaultHandler);

        if (item.noNeedRow !== true) {
            menu.row();
        }
    });

    return menu;
};

export const createSimpleTextMenu = (menuName: string, menuItems: Array<string>, defaultHandler?: any) => {
    const menu = new Menu(menuName);

    menuItems.forEach(item => {
        menu.text(item, defaultHandler);
        menu.row();
    });

    return menu;
};
