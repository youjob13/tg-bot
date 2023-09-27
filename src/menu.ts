import { Menu } from '@grammyjs/menu';

export default new Menu('my-menu-identifier')
    .text('A', ctx => ctx.reply('You pressed A!'))
    .row()
    .text('B', ctx => ctx.reply('You pressed B!'));
