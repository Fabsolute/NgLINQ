interface Array<T> {
    sum(transform?: (value?: T, index?: number, list?: T[]) => number): number;

    aggregate<U>(accumulator: (accumulator: U, value?: T, index?: number, initial_value?: T) => any, initial_value?: U): any;

    all(predicate: (value?: T, index?: number, list?: T[]) => boolean): boolean;

    any(predicate?: (value?: T, index?: number, list?: T[]) => boolean): boolean;

    average(transform?: (value?: T, index?: number, list?: T[]) => number): number;

    cast<U>(): U[];

    contains(element: T): boolean;

    count(predicate?: (value?: T, index?: number, list?: T[]) => boolean): number;

    distinct(): T[];

    except(source: T[]): T[];

    first(predicate?: (value?: T, index?: number, list?: T[]) => boolean): T;

    firstOrDefault(predicate?: (value?: T, index?: number, list?: T[]) => boolean, default_value?: T): T;

    groupBy(key_selector: (key: T) => any, value_selector?: (value: T) => any): any;

    groupJoin<U>(list: U[], key1: (k: T) => any, key2: (k: U) => any, result: (first: T, second: U[]) => any): any[];

    intersect(source: T[]): T[];

    joinArray<U>(list: U[], key_selector_1: (key: T) => any, key_selector_2: (key: U) => any, value_selector: (first: T, second: U) => any): any[];

    last(predicate?: (value?: T, index?: number, list?: T[]) => boolean): T;

    lastOrDefault(predicate?: (value?: T, index?: number, list?: T[]) => boolean, default_value?: T): T;

    max(transform?: (value?: T, index?: number, list?: T[]) => number): T;

    min(transform?: (value?: T, index?: number, list?: T[]) => number): T;

    orderBy(key_selector: (key: T) => any, descending?: boolean): T[];

    orderByDescending(key_selector: (key: T) => any): T[];

    thenBy(key_selector_1?: (key: T) => any, key_selector_2?: (key: T) => any, descending?: boolean): T[];

    thenByDescending(key_selector_1?: (key: T) => any, key_selector_2?: (key: T) => any): T[];

    select<U>(transform: (value?: T, index?: number, list?: T[]) => U): U[];

    skip(count: number): T[];

    take(count: number): T[];

    union(list: T[]): T[];

    where(predicate: (value?: T, index?: number, list?: T[]) => boolean): T[];

    zip<U, O>(list: U[], value_selector: (first: T, second: U) => O): O[];
}

interface ArrayConstructor {
    range(start: number, count: number): number[];

    repeat<T>(element: T, count: number): T[];
}

Array.prototype.sum = function (transform): number {
    if (transform) {
        return this.select(transform).sum();
    }
    return this.aggregate((accumulator, value) => {
        return accumulator + value;
    }, 0);
};

Array.prototype.aggregate = function (accumulator, initial_value) {
    return this.reduce(accumulator, initial_value);
};

Array.prototype.all = function (predicate) {
    return this.every(predicate);
};

Array.prototype.any = function (predicate) {
    if (predicate) {
        return this.some(predicate);
    }
    return this.length > 0;
};

Array.prototype.average = function (transform) {
    const count = this.count(transform);
    if (count > 0) {
        return this.sum(transform) / this.count(transform);
    }
    return 0;
};

Array.prototype.cast = function () {
    return this as any;
};

Array.prototype.contains = function (element) {
    return this.any(x => x === element);
};

Array.prototype.count = function (predicate) {
    if (predicate) {
        return this.where(predicate).count();
    }
    return this.length;
};

Array.prototype.distinct = function () {
    return this.where((value, index, iterator) => iterator.indexOf(value) === index);
};

Array.prototype.except = function (source) {
    return this.where(x => !source.contains(x));
};

Array.prototype.first = function (predicate) {
    if (this.count() > 0) {
        if (predicate) {
            return this.where(predicate).first();
        }
        return this[0];
    }

    throw new Error('InvalidOperationException');
};

Array.prototype.firstOrDefault = function (predicate, default_value) {
    return this.first(predicate) || default_value;
};


Array.prototype.groupBy = function (key_selector, value_selector) {
    return this.aggregate((accumulator, value) => {
        const selected_key = key_selector(value);
        let selected_value = value;
        if (value_selector) {
            selected_value = value_selector(value);
        }

        const selected = accumulator[selected_key];
        if (selected) {
            selected.push(selected_value);
        } else {
            accumulator[selected_key] = [selected_value];
        }
        return accumulator;
    }, {});
};

Array.prototype.groupJoin = function (list, key_selector_1, key_selector_2, value_selector) {
    return this.select((item1, item2) => {
        return value_selector(item1, list.where(x => key_selector_1(x) === key_selector_2(x)));
    });
};


Array.prototype.intersect = function (source) {
    return this.where(x => source.contains(x));
};

Array.prototype.joinArray = function (list, key_selector_1, key_selector_2, value_selector) {
    return this.selectMany(x => list.where(y => key_selector_2(y) === key_selector_1(x)).select(z => value_selector(x, z)));
};


Array.prototype.last = function (predicate) {
    if (this.count() > 0) {
        if (predicate) {
            return this.where(predicate).last();
        }
        return this[this.count() - 1];
    }

    throw new Error('InvalidOperationException');
};

Array.prototype.lastOrDefault = function (predicate, default_value) {
    return this.last(predicate) || default_value;
};

Array.prototype.min = function (transform) {
    if (transform) {
        return this.select(transform).min();
    }

    return this.aggregate((x, y) => (x > y) ? y : x);
};


Array.prototype.max = function (transform) {
    if (transform) {
        return this.select(transform).max();
    }

    return this.aggregate((x, y) => (x > y) ? x : y);
};

Array.prototype.orderBy = function (key_selector, descending) {
    return this.sort((a, b) => {
        let a_key = a;
        let b_key = b;

        if (key_selector) {
            a_key = key_selector(a);
            b_key = key_selector(b);
        }

        let response = 0;
        if (a_key > b_key) {
            response = 1;
        } else if (a_key < b_key) {
            response = -1;
        } else {
            response = 0;
        }
        return response * (descending ? -1 : 1);
    });
};

Array.prototype.orderByDescending = function (key_selector) {
    return this.orderBy(key_selector, true);
};

Array.prototype.thenBy = function (key_selector_1, key_selector_2, descending) {
    const create_comparer = key_selector => {
        return (a, b) => {
            let a_key = a;
            let b_key = b;

            if (key_selector) {
                a_key = key_selector(a);
                b_key = key_selector(b);
            }

            let response = 0;
            if (a_key > b_key) {
                response = 1;
            } else if (a_key < b_key) {
                response = -1;
            } else {
                response = 0;
            }
            return response * (descending ? -1 : 1);
        };
    };

    const first_comparer = create_comparer(key_selector_1);
    const second_comparer = create_comparer(key_selector_2);

    return this.sort((a, b) => {
        const first_result = first_comparer(a, b);
        if (!first_result) {
            return second_comparer(a, b);
        }
        return first_result;
    });
};

Array.prototype.thenByDescending = function (key_selector_1, key_selector_2) {
    return this.thenBy(key_selector_1, key_selector_2, true);
};

Array.prototype.select = function (transform) {
    return this.map(transform);
};

Array.prototype.skip = function (count) {
    return this.slice(Math.max(0, count));
};

Array.prototype.take = function (count) {
    return this.slice(0, Math.max(0, count));
};

Array.prototype.union = function (list) {
    return this.concat(list).distinct();
};

Array.prototype.where = function (predicate) {
    return this.filter(predicate);
};

Array.prototype.zip = function (list, value_selector) {
    if (list.count() < this.count()) {
        return list.select((x, y) => value_selector(this[y], x));
    }
    return this.select((x, y) => value_selector(x, list[y]));
};

Array.repeat = function (element, count) {
    const output = [];
    while (count--) {
        output.push(element);
    }
    return output;
};

Array.range = function (start, count) {
    const output = [];
    while (count--) {
        output.push(start++);
    }
    return output;
};
